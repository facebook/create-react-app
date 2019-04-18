import React from 'react';
import PropTypes from 'prop-types';
const Link = ({ href, children, className, style }) => (
  <a
    href={href}
    target="_blank"
    className={className}
    style={style}
    rel="noopener noreferrer"
  >
    {children}
  </a>
);

Link.propTypes = {
  href: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
  className: PropTypes.string,
  style: PropTypes.shape(),
};

export default Link;
