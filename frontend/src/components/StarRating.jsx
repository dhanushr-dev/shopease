import { HiStar, HiOutlineStar } from 'react-icons/hi';

export default function StarRating({ rating = 0, size = 'w-5 h-5', max = 5, onChange, readOnly = true }) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(max)].map((_, i) => {
        const starValue = i + 1;
        const Icon = starValue <= Math.round(rating) ? HiStar : HiOutlineStar;
        
        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange && onChange(starValue)}
            className={`transition-transform duration-200 ${!readOnly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
          >
            <Icon 
              className={`${size} ${starValue <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-surface-300'}`} 
            />
          </button>
        );
      })}
    </div>
  );
}
