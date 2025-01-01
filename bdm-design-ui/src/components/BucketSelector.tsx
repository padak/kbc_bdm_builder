import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { KeboolaBucket } from '../services/keboolaApi';

interface BucketSelectorProps {
  buckets: KeboolaBucket[];
  selectedBucket: KeboolaBucket | null;
  onBucketSelect: (bucket: KeboolaBucket) => void;
}

export const BucketSelector: React.FC<BucketSelectorProps> = ({
  buckets,
  selectedBucket,
  onBucketSelect,
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    const bucket = buckets.find(b => b.id === event.target.value);
    if (bucket) {
      onBucketSelect(bucket);
    }
  };

  return (
    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
      <InputLabel>Select Bucket</InputLabel>
      <Select
        value={selectedBucket?.id || ''}
        label="Select Bucket"
        onChange={handleChange}
      >
        {buckets.map((bucket) => (
          <MenuItem key={bucket.id} value={bucket.id}>
            {bucket.name} ({bucket.stage})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}; 