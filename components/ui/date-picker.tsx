'use client';

import * as React from 'react';
import { format, isValid, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import type { Matcher } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

function parseDateValue(value: string): Date | undefined {
  if (!value) return undefined;
  const date = parse(value, 'yyyy-MM-dd', new Date());
  return isValid(date) ? date : undefined;
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: Matcher | Matcher[];
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parseDateValue(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal h-auto px-4 py-2.5 bg-white text-gray-900 border-gray-300 hover:bg-white hover:text-gray-900',
            !selected && 'text-gray-500',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {selected ? format(selected, 'PPP') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-white text-gray-900 border-gray-200"
        align="start"
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) {
              onChange(format(date, 'yyyy-MM-dd'));
              setOpen(false);
            }
          }}
          disabled={disabled}
          className="bg-white text-gray-900"
        />
      </PopoverContent>
    </Popover>
  );
}

export { parseDateValue };
