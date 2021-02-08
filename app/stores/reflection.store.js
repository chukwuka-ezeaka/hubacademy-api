const slugify = require('slugify');
const Reflection = require('../models/models.index').Reflection;
const db = require('../../config/db');
const moment = require('moment');
const { Op } = require("sequelize");
const paginate = require('../../helpers/index').paginate

class ReflectionStore {

    static async create(req, res, next) {
        const { user } = req;
        const payload = {...req.body, postedBy:req.user.id, slug: slugify(req.body.title.replace("#", "").toLowerCase()),}
        try {
          await Reflection.create(payload).then((response)=>{
              res.send({status: "success", data: response, message: "Created Reflection"});
          })
        } catch (err) {
            if (err.errors) {
                next(new Error(err.errors[0].message))

            } else {
                next(new Error(err.message))

            }
        }
    }

    static async all (req,res, next) {
        try {
            const { page = 0, limit = 20 } = req.query;
            const today = moment().format('YYYY-MM-D');
            var past_year = moment().subtract(3, 'month').format('YYYY-MM-D');

            Reflection.findAndCountAll({
                where: {
                    // [Op.and]: [
                    //     db.where(db.fn('month', db.col("date")), today)
                    // ],
                    // [Op.or]: [
                    //     db.where(db.fn('day', db.col("date")), past_year)
                    // ]
                    date: {
                        // [Op.lt]: today
                        [Op.lte]: today,
                    }
                },
                order: [
                    ['date','DESC']
                ],
                ...paginate({page,limit})
            }).then(data =>
                res.send({
                    data: data.rows,
                    status: "success",
                    totalRows:data.count,
                    currentPage:page
                })
            )
                .catch(err => {
                    next(new Error(err.message))
                })
        }catch (e) {

        }
    }

    static async allAdmin (req,res, next) {
        try {
            const { page = 0, limit = 20 } = req.query;
            const today = moment().format('YYYY-MM-D');
            var past_year = moment().subtract(3, 'month').format('YYYY-MM-D');

            Reflection.findAndCountAll({
                where: {
                    // [Op.and]: [
                    //     db.where(db.fn('month', db.col("date")), today)
                    // ],
                    // [Op.or]: [
                    //     db.where(db.fn('day', db.col("date")), past_year)
                    // ]
                    // date: {
                    //     // [Op.lt]: today
                    //     [Op.lte]: today,
                    // }
                },
                order: [
                    ['date','DESC']
                ],
                ...paginate({page,limit})
            }).then(data =>
                res.send({
                    data: data.rows,
                    status: "success",
                    totalRows:data.count,
                    currentPage:page
                })
            )
                .catch(err => {
                    next(new Error(err.message))
                })
        }catch (e) {

        }
    }

    static async get (req,res, next) {
        Reflection.findByPk(req.params.id,{
        }).then(data=> {
                if (data) {
                    res.send({data: data, status: "success", message:"Reflection found"})
                } else {
                    res.status(400).send({data: {}, status: "fail",message:"Reflection not found"})
                }
            }
        )
            .catch(err=>{
                next(new Error(err.message))
            })
    }

    static async getToday (req,res, next) {
     try {
         const today = moment().format('YYYY-MM-D');

         Reflection.findOne({
             where: {date: today}
         }).then(data => {
                 if (data) {
                     res.send({data: data, status: "success", message: "Reflection found"})
                 } else {
                     res.status(400).send({data: {}, status: "fail", message: "Reflection not found"})
                 }
             }
         )
             .catch(err => {
                 next(new Error(err.message))
             })
     }catch (e) {

     }
    }

    static async delete (req,res, next) {
        const { id } = req.params;
                Reflection.destroy({where:{
                        id
                    }}).then(data=> {
                        if(data){
                            res.send({ status: "success", message:"Reflection removed"})
                        }else{
                            res.send({ status: "fail", message:"Reflection not found"})
                        }
                    }
                )
                    .catch(err=>{
                        next(new Error(err.message))
                    })
    }

    static async update (req,res, next) {
        const { id } = req.params;

        try {
            await Reflection.update(req.body, {where: {id: id}}).then(async data=>{
                if(data){
                    if(data[0]) {
                        const updatedData = await Reflection.findByPk(id);
                        res.send({status: "success", message: "Reflection updated", data: updatedData})
                    }else{
                        res.send({status: "fail", message: "Reflection not found"})
                    }
                }else{
                    res.send({status: "fail", message: "Reflection not found"})
                }
            })

        }catch (err) {
            next(new Error(err.message))
        }
    }
}

module.exports = ReflectionStore;