const express = require("express")
const router = express.Router();
const Posts = require("../models/Posts")

router.get("/get",(req,res)=>{
    Posts.find()
    .then((resp)=> res.status(200).json(resp))
    .catch((err)=> res.status(400).json("Request failed"))
})

