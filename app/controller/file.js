"use strict";
const fs = require("fs");
const path = require("path");
const {
  bucket,
  imageUrl,
  accessKey,
  secretKey,
  prefix,
} = require("../../secret.js");
//故名思意 异步二进制 写入流
const awaitWriteStream = require("await-stream-ready").write;
//管道读入一个虫洞。
const sendToWormhole = require("stream-wormhole");
const qiniu = require("qiniu");
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const options = {
  scope: bucket,
};
const putPolicy = new qiniu.rs.PutPolicy(options);

let config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_z0;
const Controller = require("egg").Controller;

class FileController extends Controller {
  async create() {
    // 每次重新获取token，防止过期
    const uploadToken = putPolicy.uploadToken(mac);
    // 获取文件流
    const stream = await this.ctx.getFileStream();
    // 定义文件名
    const filename =
      Date.now() + path.extname(stream.filename).toLocaleLowerCase();
    // 目标文件
    const target = path.join(__dirname, "../public", filename);
    //
    const writeStream = fs.createWriteStream(target);
    console.log("-----------获取表单中其它数据 start--------------");
    console.log(filename);
    console.log("-----------获取表单中其它数据 end--------------");
    try {
      //异步把文件流 写入
      await awaitWriteStream(stream.pipe(writeStream));
      const formUploader = new qiniu.form_up.FormUploader(config);
      const putExtra = new qiniu.form_up.PutExtra();
      const urlAddress = `${prefix}/${filename}`;
      console.log(uploadToken, "uploadToken");
      const imgSrc = await new Promise((resolve, reject) => {
        formUploader.putFile(
          uploadToken,
          urlAddress,
          target,
          putExtra,
          (respErr, respBody, respInfo) => {
            if (respBody.error) {
              reject(respBody.error);
            }
            if (respInfo.statusCode == 200) {
              //img.woaidq.xyz/1609685727377.png
              resolve(`http://${imageUrl}/${respBody.key}`);
            } else {
              reject("");
            }
            // 上传之后删除本地文件
            fs.unlinkSync(target);
          }
        );
      });
      console.log(imgSrc, "imgSrc");
      if (imgSrc !== "") {
        // 自定义方法
        this.ctx.success("上传成功", { url: imgSrc });
      } else {
        this.ctx.failure("上传失败");
      }
    } catch (err) {
      console.log(err);
      //如果出现错误，关闭管道
      await sendToWormhole(stream);
      // 自定义方法
      this.ctx.failure("上传失败", err);
    }
  }
}

module.exports = FileController;
