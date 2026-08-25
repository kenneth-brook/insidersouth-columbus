#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', 'src', 'data', 'columbus')
const REPORT_PATH = path.join(__dirname, 'geocode-columbus-report.json')
const TOKEN = process.env.MAPBOX_TOKEN || process.env.MAPBOX_ACCESS_TOKEN
const WRITE = process.argv.includes('--write')
const FORCE = process.argv.includes('--force')

if (!TOKEN) {
  console.error('Missing Mapbox token.')
  console.error('Set MAPBOX_TOKEN or MAPBOX_ACCESS_TOKEN before running this script.')
  process.exit(1)
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const buildAddress = (item) => {
  const parts = [
    item.street_address,
    item.city,
    item.state,
    item.zip,
  ].filter(Boolean)

  return parts.join(', ')
}

const geocodeAddress = async (address) => {
  const params = new URLSearchParams({
    q: address,
    access_token: TOKEN,
    country: 'US',
    limit: '1',
    autocomplete: 'false',
  })

  const url = `https://api.mapbox.com/search/geocode/v6/forward?${params.toString()}`
  const response = await fetch(url)

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Mapbox ${response.status}: ${body}`)
  }

  const data = await response.json()
  return data.features?.[0] || null
}

const getConfidence = (feature) => {
  const matchCode = feature?.properties?.match_code
  if (!matchCode) return null

  return matchCode.confidence || null
}

const getResolvedAddress = (feature) => {
  return (
    feature?.properties?.full_address ||
    feature?.properties?.name_preferred ||
    feature?.properties?.name ||
    null
  )
}

const main = async () => {
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((file) => file.endsWith('.json'))
    .sort()

  const report = {
    generated_at: new Date().toISOString(),
    mode: WRITE ? 'write' : 'dry-run',
    processed: 0,
    updated: 0,
    skipped_existing: 0,
    skipped_no_address: 0,
    failed: 0,
    results: [],
  }

  console.log(`Columbus geocoder: ${WRITE ? 'WRITE' : 'DRY RUN'} mode`)
  console.log(`Data directory: ${DATA_DIR}`)
  console.log('')

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file)
    const records = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    let fileChanged = false

    if (!Array.isArray(records)) {
      console.warn(`Skipping ${file}: expected a JSON array.`)
      continue
    }

    for (const item of records) {
      report.processed += 1

      const hasCoords =
        Number.isFinite(item.lat) && Number.isFinite(item.long)

      if (hasCoords && !FORCE) {
        report.skipped_existing += 1
        report.results.push({
          file,
          id: item.id,
          name: item.name,
          status: 'skipped-existing',
          lat: item.lat,
          long: item.long,
        })
        continue
      }

      const address = buildAddress(item)

      if (!address) {
        report.skipped_no_address += 1
        report.results.push({
          file,
          id: item.id,
          name: item.name,
          status: 'skipped-no-address',
        })
        console.log(`SKIP  ${item.name}: no address`)
        continue
      }

      try {
        const feature = await geocodeAddress(address)

        if (!feature || !Array.isArray(feature.geometry?.coordinates)) {
          report.failed += 1
          report.results.push({
            file,
            id: item.id,
            name: item.name,
            address,
            status: 'no-match',
          })
          console.log(`MISS  ${item.name}: ${address}`)
          continue
        }

        const [long, lat] = feature.geometry.coordinates
        const confidence = getConfidence(feature)
        const resolvedAddress = getResolvedAddress(feature)

        report.results.push({
          file,
          id: item.id,
          name: item.name,
          address,
          status: 'matched',
          lat,
          long,
          confidence,
          resolved_address: resolvedAddress,
        })

        console.log(
          `MATCH ${item.name}: ${lat}, ${long}` +
            (confidence ? ` [${confidence}]` : '')
        )

        if (WRITE) {
          item.lat = lat
          item.long = long
          fileChanged = true
          report.updated += 1
        }
      } catch (error) {
        report.failed += 1
        report.results.push({
          file,
          id: item.id,
          name: item.name,
          address,
          status: 'error',
          error: error.message,
        })
        console.error(`ERROR ${item.name}: ${error.message}`)
      }

      // Keep the one-off utility gentle on the API and easy to inspect.
      await sleep(100)
    }

    if (WRITE && fileChanged) {
      fs.writeFileSync(filePath, `${JSON.stringify(records, null, 2)}\n`)
    }
  }

  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)

  console.log('')
  console.log(`Processed: ${report.processed}`)
  console.log(`Updated: ${report.updated}`)
  console.log(`Existing coordinates skipped: ${report.skipped_existing}`)
  console.log(`No address skipped: ${report.skipped_no_address}`)
  console.log(`Failed/no match: ${report.failed}`)
  console.log(`Report: ${REPORT_PATH}`)

  if (!WRITE) {
    console.log('')
    console.log('Dry run only. Re-run with --write after reviewing the report.')
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
