// src/components/CartTotal.jsx
import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';

const CartTotal = ({ selectedItems }) => {
  const { currency, delivery_fee } = useContext(ShopContext);

  // Calculate subtotal based on selected items
  const calculateSelectedSubtotal = () => {
    if (!selectedItems || selectedItems.length === 0) return 0;
    return selectedItems.reduce((acc, item) => {
      return acc + (item.product.price * item.quantity);
    }, 0);
  };

  const subtotal = calculateSelectedSubtotal();
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
