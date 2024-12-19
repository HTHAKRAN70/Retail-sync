import {createSlice} from '@reduxjs/toolkit';
const initialState={    
    currentUser:null,
    error:null,
    Loading:false,
    temp:false,
    pendingorders:0,
    totalproducts:0,
};
const userSlice=createSlice({
    name:'user',
    initialState,
    reducers:{
        signInstart:(state)=>{
            state.Loading=true;
            state.error=null;
        },
        signInsuccess:(state,action)=>{
            state.currentUser=action.payload;
            state.Loading=false;
            state.error=null;
            state.temp=false;
        },
        signInfailure:(state,action)=>{
            state.Loading=false;
            state.error=action.payload;
        },
        updateStart:(state,action)=>{
            state.Loading=false;
            state.error=action.payload;
        },
        updateSuccess:(state,action)=>{
            state.currentUser=action.payload;
            state.Loading=false;
            state.error=false;
        },
        updateFailure:(state,action)=>{
            state.Loading=false;
            state.error=action.payload;
        },
        deleteuserStart:(state,action)=>{
            state.Loading=false;
            state.error=action.payload;
        },
        deleteuserSuccess:(state,action)=>{
           state.currentUser=null;
           state.Loading=false;
           state.error=false; 
        },
        deleteuserFailure:(state,action)=>{
            state.Loading=false;
            state.error=action.payload;
        },
        signoutSuccess:(state)=>{
            state.currentUser=null;
            state.Loading=false;
            state.error=null;
        },
        setPendingOrders:(state,action)=>{
            console.log("setting");
            state.tobeconfirmed=action.payload;
            state.pendingorders=action.payload;
            
        },
        decrementOrders:(state)=>{
            console.log("decreasing");
            state.pendingorders-=1;
        },
        setproductslength:(state,action)=>{
            console.log("yha tk to agya");
            state.totalproducts=action.payload
        },
        decreaseproducts:(state)=>{
            state.totalproducts-=1;
        }

    },
});
export const {setproductslength,decreaseproducts,setPendingOrders,decrementOrders,signoutSuccess,deleteuserStart,deleteuserSuccess,deleteuserFailure,signInfailure,signInstart,signInsuccess,updateStart,updateFailure,updateSuccess}=userSlice.actions;
export default userSlice.reducer;
