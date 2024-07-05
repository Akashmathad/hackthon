'use client';
import { Cabins } from '@repo/db/client';
import { Dispatch, FC, SetStateAction } from 'react';
import { useReservation } from './ReservationContext';
import {
  differenceInDays,
  isPast,
  isSameDay,
  isWithinInterval,
} from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface DateSelectorProps {
  settings: {
    minBookingLength: number;
    maxBookingLength: number;
    maxGuestsPerBooking: number;
    breakfastPrice: number;
  };
  cabin: Cabins;
  bookedDates: Date[][];
}

const isAlreadyBooked = (
  range: {
    from: Date | undefined;
    to: Date | undefined;
  },
  dateArr: Date[][],
) => {
  return (
    range.from &&
    range.to &&
    dateArr.some((dateRange) =>
      dateRange.some((date) =>
        isWithinInterval(date, { start: range.from!, end: range.to! }),
      ),
    )
  );
};

const DateSelector: FC<DateSelectorProps> = ({
  settings,
  cabin,
  bookedDates,
}) => {
  //@ts-ignore
  const {
    range,
    setRange,
    resetRange,
  }: {
    range: {
      from: Date | undefined;
      to: Date | undefined;
    };
    setRange: Dispatch<
      SetStateAction<{
        from: Date | undefined;
        to: Date | undefined;
      }>
    >;
    resetRange: () => void;
  } = useReservation();

  const displayRange = isAlreadyBooked(range, bookedDates) ? {} : range;
  const { regularPrice, discount } = cabin;
  //@ts-ignore
  const numNights = differenceInDays(
    //@ts-ignore
    displayRange.to || new Date(),
    //@ts-ignore
    displayRange.from || new Date(),
  );
  const cabinPrice = numNights * (Number(regularPrice) - discount);
  const { minBookingLength, maxBookingLength } = settings;

  return (
    <div className="flex flex-col justify-between">
      <DayPicker
        className="pt-12 place-self-center"
        mode="range"
        //@ts-ignore
        onSelect={setRange}
        //@ts-ignore
        selected={displayRange}
        min={minBookingLength + 1}
        max={maxBookingLength}
        fromMonth={new Date()}
        fromDate={new Date()}
        toYear={new Date().getFullYear() + 5}
        captionLayout="dropdown"
        numberOfMonths={2}
        disabled={(curDate) =>
          isPast(curDate) ||
          bookedDates.some((dateRange) =>
            dateRange.some((date) => isSameDay(date, curDate)),
          )
        }
      />

      <div className="flex items-center justify-between px-8 bg-accent-500 text-primary-800 h-[72px]">
        <div className="flex items-baseline gap-6">
          <p className="flex gap-2 items-baseline">
            {discount > 0 ? (
              <>
                <span className="text-2xl">
                  	&#8377;{Number(regularPrice) - discount}
                </span>
                <span className="line-through font-semibold text-primary-700">
                  	&#8377;{regularPrice}
                </span>
              </>
            ) : (
              <span className="text-2xl">${regularPrice}</span>
            )}
            <span className="">/night</span>
          </p>
          {numNights ? (
            <>
              <p className="bg-accent-600 px-3 py-2 text-2xl">
                <span>&times;</span> <span>{numNights}</span>
              </p>
              <p>
                <span className="text-lg font-bold uppercase">Total</span>{' '}
                <span className="text-2xl font-semibold">${cabinPrice}</span>
              </p>
            </>
          ) : null}
        </div>

        {range.from || range.to ? (
          <button
            className="border border-primary-800 py-2 px-4 text-sm font-semibold"
            onClick={resetRange}
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default DateSelector;
