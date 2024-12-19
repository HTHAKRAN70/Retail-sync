import {createSlice} from '@reduxjs/toolkit';
const initialState={    
    currentshop:null,
    temp2:false,
};
const shopslice=createSlice({
    name:'shop',
    initialState,
    reducers:{
        vendorRendor:(state,action)=>{
            state.currentshop=action.payload;
             state.temp2=false;
            },
        vendorClear:(state,action)=>{
            state.currentshop=null;
        },
           
    },
});
export const {vendorRendor,vendorClear}=shopslice.actions;
export default shopslice.reducer;
