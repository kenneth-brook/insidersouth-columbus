# Insider South Columbus

A React-based tourism guide demo for Columbus, Georgia. The project presents places to stay, play, dine, shop, and attend events, with map views, location detail pages, proximity sorting, and a locally persisted itinerary builder.

## Current Demo Features

- Category browsing for Stay, Play, Dine, Shop, and Events
- Responsive desktop and mobile layouts
- Mapbox-powered map views
- Keyword search and category/type filtering
- Alphabetical sorting
- Near Me sorting using browser geolocation
- Distance displayed on location cards when location access is available
- Location detail pages with website, phone, directions, map, share, and itinerary actions
- Optional outside-publication links driven by JSON data
- Single-itinerary demo flow
- Itinerary entries grouped by day
- Desktop itinerary day layout with one centered column for a single day, two columns for two days, and alternating centered rows for odd additional days
- Mobile itinerary layout reduced to one column
- Editable itinerary date and time
- Delete confirmation for itinerary entries
- Itinerary persistence in localStorage
- Demo login persistence using cookies
- Pre-populated demo login credentials

## Demo Login

The login flow is simulated for demonstration purposes. No production authentication service is used.

- Email: `demo@visitcolumbusga.com`
- Password: `demo1234`

Login state is stored in cookies for the current browser, while itinerary data is stored locally in the browser.

## Data

Location content is currently sourced from static JSON files in:

```text
src/data/columbus/
```

Primary data sets include:

```text
eat.json
events.json
play.json
shop.json
stay.json
```

The application normalizes those files through `DataContext` and adds a category type to each record at runtime.

### Common Location Fields

Typical location records may contain:

```json
{
  "id": "example-location",
  "name": "Example Location",
  "street_address": "123 Example St",
  "city": "Columbus",
  "state": "GA",
  "zip": "31901",
  "phone": "706-555-1234",
  "web": "https://example.com",
  "description": "Location description.",
  "images": ["/images/example.jpg"],
  "rating": 4.8,
  "lat": 32.4609,
  "long": -84.9877
}
```

### Optional Publication Link

A location can include an external publication feature link:

```json
{
  "publication_link": "https://365publicationsonline.com/ColumbusVG2026/#p=27"
}
```

When present, the main location card displays a **View Feature** button below the description. If the field is absent, no publication button is rendered.

## Itinerary Behavior

The current demo uses one itinerary rather than named or selectable itineraries.

New locations are added as Day 1 items until dates are assigned. Once dates are set, day numbers are calculated from the earliest itinerary date. Items can also be assigned times, and dated entries are ordered by date and time.

The itinerary persists under the browser localStorage key:

```text
columbus-demo-itinerary
```

This is intentionally device/browser-local for the demo and does not sync to a backend.

## Routing

The application uses React Router.

Local development runs from `/`, while the production build uses the `/columbus` basename.

Primary routes:

```text
/
/home
/stay
/play
/dine
/shop
/events
/login
/itinerary
/all
/:category/:id
```

## Tech Stack

- React 18
- Create React App / react-scripts 5
- React Router 6
- Sass
- Mapbox GL / react-map-gl
- js-cookie
- date-fns
- React Modal
- React Share

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

Create a production build:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## Geocoding Utility

The repository includes Columbus geocoding scripts:

```bash
npm run geocode:columbus
npm run geocode:columbus:write
```

The write version should only be used when intentionally updating stored coordinates.

## Demo Notes

This repository is currently being used as a working tourism-product demonstration. Authentication, itinerary storage, and some content-management behavior are intentionally simplified so the interface and user flow can be demonstrated without requiring a production backend.

Production work should replace demo authentication and browser-only itinerary storage with the intended account, API, and persistence architecture before treating the application as a production deployment.
