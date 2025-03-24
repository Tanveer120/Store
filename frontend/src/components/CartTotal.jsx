import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';

const CartTotal = ({ selectedItems }) => {
  const { currency, delivery_fee, products } = useContext(ShopContext);

  // Calculate subtotal based on selected items only
  const calculateSelectedSubtotal = () => {
    if (!selectedItems || selectedItems.length === 0) return 0;
    return selectedItems.reduce((acc, item) => {
      const product = products.find(prod => prod._id === item.id);
      return product ? acc + product.price * item.quantity : acc;
    }, 0);
  };

  // If no items are selected, subtotal is zero
  const subtotal = selectedItems && selectedItems.length > 0 
    ? calculateSelectedSubtotal() 
    : 0;
  // Only add shipping fee if subtotal > 0
  const total = subtotal > 0 ? subtotal + delivery_fee : 0;

  return (
    <div className="w-full">
      <div className="text-2xl">
        <Title text1={'CART '} text2={'TOTALS'} />
      </div>
      <div className="flex flex-col gap-2 mt-2 text-sm">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>{currency}{subtotal}.00</p>
        </div>
        <hr />
        <div className="flex justify-between">
          <p>Shipping Fees</p>
          <p>{currency}{subtotal > 0 ? delivery_fee : 0}.00</p>
        </div>
        <hr />
        <div className="flex justify-between">
          <b>Total</b>
          <b>{currency}{total}.00</b>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;
