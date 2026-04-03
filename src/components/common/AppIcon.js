import React from 'react';
import { Ionicons } from '@expo/vector-icons';

/**
 * A centralized Icon component that handles both SVG assets and Ionicons.
 *
 * @param {Object} props
 * @param {React.Component|string} props.icon - The SVG component or Ionicons name string.
 * @param {number} props.size - The width and height of the icon (default: 24).
 * @param {string} props.color - The fill color for the icon.
 */
const AppIcon = ({ icon: Icon, size = 24, color = '#8A92A6' }) => {
  if (!Icon) return null;

  if (typeof Icon === 'string') {
    return <Ionicons name={Icon} size={size} color={color} />;
  }

  return <Icon width={size} height={size} fill={color} />;
};

export default AppIcon;
