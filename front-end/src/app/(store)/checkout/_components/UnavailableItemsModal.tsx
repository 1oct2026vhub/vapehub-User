import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
// import { StockValidationResponse } from '@/lib/config/cart.config';
import { useCart } from '@/lib/context/CartContext';
import NoImage from '@/components/NoImage';
// import QuantitySelector from '@/components/QuantitySelector';
// import { CartItem } from '@/lib/config/cart.config';

interface UnavailableItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UnavailableItemsModal: React.FC<UnavailableItemsModalProps> = ({
  isOpen,
  onClose 
}) => {
  const { removeItem, unAvailableItems, checkoutStockValidation } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle removal of an unavailable item
  const handleRemoveItem = async (itemId: number) => {
    setIsProcessing(true);
    await removeItem(itemId);
    
    // Check if any issues remain after removal
    const isValid = await checkoutStockValidation();
    if (isValid) {
      onClose(); // Close modal if all issues are resolved
    }
    setIsProcessing(false);
  };

  // Remove all unavailable items at once
  const handleRemoveAllItems = async () => {
    setIsProcessing(true);
    for (const item of unAvailableItems) {
      await removeItem(item.id);
    }
    onClose();
    setIsProcessing(false);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-skin-neutral-500 font-bold">Unavailable Items in Cart</h3>
            </ModalHeader>
            <ModalBody>
              <p className="text-skin-neutral-400 mb-4">
                The following items in your cart are unavailable or have insufficient stock:
              </p>
              <div className="space-y-4">
                    {unAvailableItems.map((item) => {
                  return (
                    <div key={item.id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-3">
                         
                          <div className="w-16 h-16 relative overflow-hidden rounded-md">
                            <NoImage 
                              src={item.ProductImages} 
                              alt={item?.name || 'Product'} 
                              className="object-cover w-full h-full"
                            />
                          </div>
                        
                        <div>
                          <h4 className="text-content-2 font-semibold text-skin-neutral-500">
                            {item?.name || 'Product'}
                          </h4>
                          <p className="text-skin-red-400 text-sm">{item.errorMessage}</p>
                        </div>
                        {/* {
                            item.isInsufficientStock && (
                                <QuantitySelector item={item as CartItem} />
                            )
                        } */}
                      </div>
                      <Button 
                        size="sm"
                        color="danger" 
                        variant="light"
                        className="text-skin-red-400"
                        onPress={() => handleRemoveItem(item.id)}
                        isLoading={isProcessing}
                        isDisabled={isProcessing}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button 
                color="default" 
                variant="light" 
                onPress={onClose}
                isDisabled={isProcessing}
              >
                Close
              </Button>
              <Button 
                color="danger"
                className="!bg-skin-red-400" 
                onPress={handleRemoveAllItems}
                isLoading={isProcessing}
                isDisabled={isProcessing}
              >
                Remove All Unavailable Items
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default UnavailableItemsModal; 