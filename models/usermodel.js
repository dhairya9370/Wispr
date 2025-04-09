const mongoose = require('mongoose');

const userSchema= new mongoose.Schema({
    btId:{type:String, required:true},
    pass:{type:String, required:true},
    email:{type:String, required:true}
});
// let user= mongoose.model("User",userSchema);
module.exports=userSchema;
