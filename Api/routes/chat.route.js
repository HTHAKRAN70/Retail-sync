import express from 'express';
import {getallretailers,getchat,getallmessages,sendMessage,getallvendors} from '../controller/chat.controller.js';

const router=express.Router();
router.get('/allretailers/:vendorId',getallretailers);
router.get('/allvendors/:retailerId',getallvendors);
router.get('/:chatId/message',getallmessages);
router.get('/:retailerId/:vendorId',getchat);
router.post('/message',sendMessage);
export default router;