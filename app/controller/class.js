"use strict";

const Controller = require("egg").Controller;

class ClassController extends Controller {
  async index() {
    const ctx = this.ctx;
    const result = await ctx.model.Class.findAll()
      .then((res) => {
        ctx.success("", res);
      })
      .catch((error) => {
        ctx.failure("", error);
      });
    return result;
  }

  async create() {
    const ctx = this.ctx;
    const query = ctx.request.body;
    const { name } = query;
    const result = await ctx.model.Class.create({
      name,
    })
      .then((res) => {
        ctx.success("添加成功", res);
      })
      .catch((error) => {
        ctx.failure("添加失败", error);
      });
    return result;
  }

  async update() {
    const ctx = this.ctx;
    const query = ctx.request.body;
    const result = await ctx.model.Class.update(
      { class: query.class },
      {
        where: {
          id: query.id,
        },
      }
    )
      .then((res) => {
        ctx.success("修改成功", res);
      })
      .catch((error) => {
        ctx.failure("修改失败", error);
      });
    return result;
  }

  async show() {
    const ctx = this.ctx;
    const id = ctx.params.id;
    const result = await ctx.model.Class.find({ id: id })
      .then((res) => {
        ctx.success("", res);
      })
      .catch((erros) => {
        ctx.failure("", res);
      });
    return result;
  }

  async destroy() {
    const ctx = this.ctx;
    const id = ctx.params.id;
    const result = await ctx.model.Class.destroy({
      where: {
        id,
      },
    })
      .then((res) => {
        ctx.success("删除成功", res);
      })
      .catch((error) => {
        ctx.failure("删除失败", error);
      });
    return result;
  }
}

module.exports = ClassController;
