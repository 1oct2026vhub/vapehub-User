import { Button } from '@nextui-org/react';
import { MinusIcon, PlusIcon } from '@/components/Icons';
import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/lib/hooks/useDebounce';


interface QuantitySelectorProps {
  initialQuantity: number;
  maxQuantity: number;
  minQuantity?: number;
  onQuantityChange: (quantity: number) => void;
  isLoading?: boolean;
  className?: string;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  initialQuantity,
  maxQuantity,
  minQuantity = 1,
  onQuantityChange,
  isLoading = false,
  className = '',
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [inputValue, setInputValue] = useState(initialQuantity.toString());
  const [error, setError] = useState<string | null>(null);
  const debouncedQuantity = useDebounce(quantity, 500);

  useEffect(() => {
    if (debouncedQuantity !== initialQuantity) {
      onQuantityChange(debouncedQuantity);
    }
  }, [debouncedQuantity, initialQuantity, onQuantityChange]);

  const handleQuantityChange = useCallback((newQuantity: number) => {
    if (newQuantity < minQuantity) {
      setError(`Minimum quantity is ${minQuantity}`);
      return;
    }
    if (newQuantity > maxQuantity) {
      setError(`Only ${maxQuantity} items available in stock`);
      return;
    }
    setError(null);
    setQuantity(newQuantity);
    setInputValue(newQuantity.toString());
  }, [maxQuantity, minQuantity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Only update quantity if the input is a valid number
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      if (numValue < minQuantity) {
        setError(`Minimum quantity is ${minQuantity}`);
      } else if (numValue > maxQuantity) {
        setError(`Only ${maxQuantity} items available in stock`);
      } else {
        setError(null);
        setQuantity(numValue);
      }
    }
  };

  const handleBlur = () => {
    // Reset to current quantity if input is invalid
    const numValue = parseInt(inputValue);
    if (isNaN(numValue) || numValue < minQuantity || numValue > maxQuantity) {
      setInputValue(quantity.toString());
      setError(null);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className={`flex items-center border bg-skin-white w-fit shadow-base text-content-2 md:text-title-1 border-skin-primary-500 !leading-none px-2 rounded md:rounded-10 !font-bold h-5 md:h-10 ${className}`}>
        <Button
          isIconOnly
          size="lg"
          variant="light"
          color="primary"
          className={`text-title-1 font-medium !px-0 !w-fit md:!w-6 !min-w-fit !h-5 md:!h-10 first:rounded-l-10 last:rounded-r-10 hover:!bg-transparent ${isLoading ? '!opacity-50 cursor-not-allowed' : ''}`}
          onPress={() => handleQuantityChange(quantity - 1)}
          disabled={isLoading || quantity <= minQuantity}
        >
          <MinusIcon className='w-3 md:w-6'/>
        </Button>
        <input 
          type="tel" 
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          pattern="[0-9]*"
          inputMode="numeric"
          className='w-9 max-w-[40px] max-sm:h-3 text-center !border-none !outline-none placeholder:text-skin-neutral-500' 
        />
        <Button
          isIconOnly
          size="lg"
          variant="light"
          color="primary"
          className={`text-title-1 font-medium !px-0 !w-fit md:!w-6 !min-w-fit !h-5 md:!h-10 first:rounded-l-10 last:rounded-r-10 hover:!bg-transparent ${isLoading ? '!opacity-50 cursor-not-allowed' : ''}`}
          onPress={() => handleQuantityChange(quantity + 1)}
          disabled={isLoading || quantity >= maxQuantity}
        >
          <PlusIcon className='w-3 md:w-6'/>
        </Button>
      </div>
      {error && (
        <p className="text-red-500 text-xs md:text-sm font-medium">{error}</p>
      )}
    </div>
  );
};

export default QuantitySelector; 