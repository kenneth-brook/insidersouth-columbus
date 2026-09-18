import React from 'react';
import '../../sass/componentsass/PublicationButton.scss';

const PublicationButton = ({ item }) => {
  if (!item?.publication_link) return null;

  return (
    <a
      className="publication-button"
      href={item.publication_link}
      target="_blank"
      rel="noopener noreferrer"
    >
      View Feature
    </a>
  );
};

export default PublicationButton;
