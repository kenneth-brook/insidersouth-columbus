import React from 'react';
import Modal from 'react-modal';
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  LinkedinShareButton,
  LinkedinIcon,
  EmailShareButton,
  EmailIcon,
} from 'react-share';

const GOLD = '#B8924A';
const BLACK = '#2D2D2D';
const CREAM = '#F8F2EC';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    minWidth: '250px',
    padding: '28px 30px 24px',
    background: CREAM,
    color: BLACK,
    border: `2px solid ${BLACK}`,
    borderRadius: '12px',
    boxShadow: '0 14px 40px rgba(45, 45, 45, 0.28)',
    zIndex: 1000,
  },
  overlay: {
    backgroundColor: 'rgba(45, 45, 45, 0.45)',
    zIndex: 1000,
  },
};

const iconProps = {
  size: 38,
  round: true,
  bgStyle: { fill: GOLD },
  iconFillColor: BLACK,
};

const ShareModal = ({ isOpen, onRequestClose, url, title }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Share Modal"
      ariaHideApp={false}
    >
      <h2
        style={{
          margin: 0,
          color: BLACK,
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: '30px',
        }}
      >
        Share this page
      </h2>

      <div
        className="share-buttons"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        <FacebookShareButton url={url} quote={title} className="share-button">
          <FacebookIcon {...iconProps} />
        </FacebookShareButton>
        <TwitterShareButton url={url} title={title} className="share-button">
          <TwitterIcon {...iconProps} />
        </TwitterShareButton>
        <LinkedinShareButton url={url} title={title} source={url} className="share-button">
          <LinkedinIcon {...iconProps} />
        </LinkedinShareButton>
        <EmailShareButton url={url} subject={title} body="Check out this site!" className="share-button">
          <EmailIcon {...iconProps} />
        </EmailShareButton>
      </div>

      <button
        onClick={onRequestClose}
        className="close-button"
        style={{
          backgroundColor: GOLD,
          color: BLACK,
          padding: '10px 26px',
          border: `2px solid ${BLACK}`,
          borderRadius: '7px',
          cursor: 'pointer',
          fontWeight: 700,
          fontFamily: 'var(--font-body)',
        }}
      >
        Close
      </button>
    </Modal>
  );
};

export default ShareModal;
