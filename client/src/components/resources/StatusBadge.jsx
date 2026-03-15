import React from 'react';
import { STATUS_OPTIONS } from '../../utils/constants';

const StatusBadge = ({ status, size = 'sm' }) => {
  const opt = STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${opt.color} ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      {opt.label}
    </span>
  );
};

export default StatusBadge;
