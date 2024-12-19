
import {createSlice} from '@reduxjs/toolkit';
const initialState={    
    pendingOrdersCount:0,
};
const OrdernoSlice=createSlice({
    name:'orders',
    initialState,
    reducers:{
        setPendingOrders:(state,action)=>{
            console.log("action",action);
            state.pendingOrdersCount = action.payload;
        },
        decrementOrders:(state)=>{
            console.log("signinsuccess");
            state.pendingOrdersCount -= 1;
        },
        
    },
});
export const {setPendingOrders, decrementOrders}=OrdernoSlice.actions;
export default OrdernoSlice.reducer;

