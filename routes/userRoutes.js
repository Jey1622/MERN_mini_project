 const express=require('express')
 const router=express.Router()
 const  userController=require('../controllers/userController')

 router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createNewUser)
    .patch(userController.updateUsers)
    .delete(userController.deleteUsers)

module.exports=router