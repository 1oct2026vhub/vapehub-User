import { Button } from '@nextui-org/react';
import { MinusIcon, PlusIcon } from '@/components/Icons';
import { useState, useCallback, useEffect } from 'react';
import { useCart } from '@/lib/context/CartContext';
import { CartItem } from '@/lib/config/cart.config';

interface QuantitySelectorProps {
  item: CartItem;
  className?: string;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  item,
  className = '',
}) => {
  const { updateItemQuantity, isLoading } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(item.quantity.toString());
  // Update input value when item quantity changes
  useEffect(() => {
    setInputValue(item.quantity.toString());
  }, [item.quantity]);

  const handleQuantityChange = useCallback(async (newQuantity: number) => {
    if (newQuantity < 1) {
      setError(`Minimum quantity is 1`);
      return;
    }
    if (newQuantity > item.stock) {
      setError(`Only ${item.stock} items available in stock`);
      return;
    }
    setError(null);
    setInputValue(newQuantity.toString());
    await updateItemQuantity(item.id, newQuantity,item.name);
  }, [item.stock, item.id, updateItemQuantity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
    setInputValue(value);

    // Only update quantity if the input is a valid number
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      if (numValue < 1) {
        setError(`Minimum quantity is 1`);
      } else if (numValue > item.stock) {
        setError(`Only ${item.stock} items available in stock`);
      } else {
        setError(null);
        updateItemQuantity(item.id, numValue, item.name);
      }
    }
  };

  const handleBlur = () => {
    const numValue = parseInt(inputValue);
    if (isNaN(numValue) || numValue < 1 || numValue > item.stock) {
      setInputValue(item.quantity.toString());
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
          onPress={() => handleQuantityChange(item.quantity - 1)}
          isDisabled={isLoading || item.quantity <= 1}
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
          onPress={() => handleQuantityChange(item.quantity + 1)}
          isDisabled={isLoading || item.quantity >= item.stock}
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