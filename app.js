const express=require('express');
const telefile=require('telefile');
const fs = require('fs');
const app=express();
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

module.exports = uploadOptions;

app.use(express.json());

app.use("/public/uploads", express.static(__dirname + "/public/uploads"));


app.post('/tele', uploadOptions.single('image'),async(req, res)=>{
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
   const filePath=`${basePath}${fileName}`;
  
    const link = await telefile({ url:filePath });

    fs.unlink(__dirname+'/public/uploads/'+fileName,function(err){
      if(err) return console.log(err);
      res.json({url:link});
 });  
  

})


app.listen(process.env.PORT||3000,()=>{
    console.log('server is running at port 3000');
})