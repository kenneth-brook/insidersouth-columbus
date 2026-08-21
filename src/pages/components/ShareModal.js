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
    zIndex: 1000, // Ensure the modal is on top
  },
  overlay: {
    zIndex: 1000, // Ensure the overlay is on top
  },
};

const ShareModal = ({ isOpen, onRequestClose, url, title }) => {
  console.log('ShareModal rendered with:', { isOpen, url, title }); // Log modal render details

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Share Modal"
      ariaHideApp={false} // Ensure this is set correctly
    >
      <h2 style={{ color: '#006837' }}>Share this page</h2>
      <div className="share-buttons">
        <FacebookShareButton url={url} quote={title} className="share-button">
          <FacebookIcon size={32} round />
        </FacebookShareButton>
        <TwitterShareButton url={url} title={title} className="share-button">
          <TwitterIcon size={32} round />
        </TwitterShareButton>
        <LinkedinShareButton url={url} title={title} source={url} className="share-button">
          <LinkedinIcon size={32} round />
        </LinkedinShareButton>
        <EmailShareButton url={url} subject={title} body="Check out this site!" className="share-button">
          <EmailIcon size={32} round />
        </EmailShareButton>
      </div>
      <button
        onClick={onRequestClose}
        className="close-button"
        style={{
          backgroundColor: '#006837',
          color: '#fff',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Close
      </button>
    </Modal>
  );
};

export default ShareModal;

