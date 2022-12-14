const express = require("express");
const bcrypt = require("bcrypt");
const { User, Follow, Comment, Posting } = require("../models");
const formatterService = require("../service/formatterService");

const { isLoggedIn } = require("./checklogin");

const router = express.Router();

/* 내 정보 요청*/
router
  .route("/")
  .get(isLoggedIn, async (req, res, next) => {
    // 로그인 유무 확인
    res.locals.isAuthenticated = isLoggedIn;
    res.locals.user = req.user;

    const id = req.user.id; // 해당하는 유저 아이디

    try {
      const user = await User.findOne({
        where: { id: id },
        include: [
          {
            model: Follow,
            attributes: ["follower", "followee"],
          },
        ],
      });

      if (user) res.json(formatterService.responseDataFormat("success", "내 정보 조회 성공", user));
      else res.json(formatterService.responseNoDataFormat("failure", "내 정보 조회 실패"));
    } catch (err) {
      console.log(err);
      next(err);
    }
  }) /* 내 정보 수정 */
  .patch(async (req, res, next) => {
    const id = req.user.id; // 해당하는 유저 아이디
    const { password, name, phone, address } = req.body;
    try {
      const hash = await bcrypt.hash(password, 12);

      const result = await User.update(
        { password: hash, name: name, phone: phone, address: address },
        {
          where: { id: id },
        }
      );
      if (result) {
        // 내 정보 수정 성공
        res.json(formatterService.responseNoDataFormat("success", "내 정보 수정 성공"));
      } else res.json(formatterService.responseNoDataFormat("failure", "내 정보 수정 실패"));
    } catch (err) {
      console.log(err);
      next(err);
    }
  });

/* 지정한 사용자 정보 요청 */
router.route("/:user_id").get(isLoggedIn, async (req, res, next) => {
  const id = req.params.user_id; // 지정한 유저 아이디

  try {
    const user = await User.findOne({
      where: { id: user_id },
      attributes: ["id", "name", "phone"],
      include: {
        model: Follow,
        attributes: ["follower", "followee"],
      },
    });

    if (user) res.json(formatterService.responseDataFormat("success", "지정한 사용자 정보 조회 성공", user)); // 지정한 사용자찾기 성공
    else res.json(formatterService.responseNoDataFormat("failure", `No user with ${user_id}.`));
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// /* 지정한 사용자 정보 삭제 */
// router.route("/:id/remove").get(isLoggedIn, async (req, res, next) => {
//   const userId = req.params.id;

//   try {
//     const result = await User.destroy({
//       where: { id: userId },
//     });
//     if (user) res.json(user);
//     else next(`No user with ${userId}.`);
//     console.log(result);
//     res.json(result);
//   } catch (err) {
//     console.log(err);
//     next(err);
//   }
// });

/* 지정한 사용자가 작성한 댓글 요청 */
router.route("/:user_id/comments").get(isLoggedIn, async (req, res, next) => {
  const user_id = req.params.user_id;

  try {
    const comments = await Comment.findAll({
      where: { user_id: user_id },
      attributes: ["content", "created_at"],
    });
    if (comments.length == 0) res.json(formatterService.responseNoDataFormat("failure", `${user_id} 사용자가 작성한 댓글 없음`));
    else res.json(formatterService.responseDataFormat("success", "지정한 사용자가 작성한 댓글 조회 성공", comments));
    //res.json(comments);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

/*지정한 사용자가 작성한 게시글 요청*/
router.route("/:user_id/postings").get(isLoggedIn, async (req, res, next) => {
  const user_id = req.params.user_id;

  try {
    const postings = await Posting.findAll({
      where: { user_id: user_id },
      attributes: ["content", "created_at"],
    });
    if (postings.length == 0) res.json(formatterService.responseNoDataFormat("failure", `${user_id} 사용자가 작성한 게시글 없음`));
    else res.json(formatterService.responseDataFormat("success", "지정한 사용자가 작성한 게시글 조회 성공", postings));
    //res.json(postings);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = router;

/* ------------------------------------------------------------------------------*/

// const pet = await Pet.findAll({
//     where: {userId: user},
//     attributes: ['id', 'petName'],
//     include: [
//         {
//             model: PetMedicine,
//             attributes: ['medicineName', 'medicineDate']
//         },
//         {
//             model: PetWalk,
//             attributes: ['whetherToWalk', 'walkDate']
//         },
//     ]
// });

// router
//   .route("/")
//   .get(async (req, res, next) => {
//     try {
//       const users = await User.findAll({
//         attributes: ["id"],
//       });

//       res.render("user", {
//         title: require("../package.json").name,
//         port: process.env.PORT,
//         users: users.map((user) => user.id),
//       });
//     } catch (err) {
//       console.error(err);
//       next(err);
//     }
//   })
//   .post(async (req, res, next) => {
//     const { id, password, name, phone, address } = req.body;

//     const user = await User.findOne({ where: { id } });
//     if (user) {
//       next("이미 등록된 사용자 아이디입니다.");
//       return;
//     }

//     try {
//       const hash = await bcrypt.hash(password, 12);
//       await User.create({
//         id,
//         password: hash,
//         name,
//         phone,
//         address,
//       });

//       res.redirect("/");
//     } catch (err) {
//       console.error(err);
//       next(err);
//     }
//   });

// router
//   .route("/update/:id")
//   .get(isLoggedIn, async (req, res, next) => {
//     console.log(req.params);
//     const user = await User.findOne({ where: { id: req.params.id } }); //수정하기 위한 사용자 조회
//     try {
//       res.locals.user = user;
//       res.locals.isAuthenticated = isLoggedIn;
//       res.render("user");
//     } catch (err) {
//       // 에러처리
//       console.error(err);
//       next(err);
//     }
//   })
//   .post(async (req, res, next) => {
//     console.log(req.body);
//     try {
//       const result = await User.update(
//         {
//           password: req.body.password,
//           name: req.body.name,
//           phone: req.body.phone,
//           address: req.body.address,
//         },
//         {
//           where: { id: req.params.id },
//         }
//       );
//       if (result) {
//         console.log("수정완료");
//         res.redirect("/");
//       } else next("Not updated!");
//     } catch (err) {
//       console.error(err);
//       next(err);
//     }
//   });

// // router.post("/update", async (req, res, next) => {
// //   try {
// //     const result = await User.update(
// //       {
// //         description: req.body.description,
// //       },
// //       {
// //         where: { id: req.body.id },
// //       }
// //     );

// //     if (result) res.redirect("/");
// //     else next(`There is no user with ${req.params.id}.`);
// //   } catch (err) {
// //     console.error(err);
// //     next(err);
// //   }
// // });

// router.get("/delete/:id", async (req, res, next) => {
//   try {
//     const result = await User.destroy({
//       where: { id: req.params.id },
//     });

//     if (result) res.redirect("/");
//     else next(`There is no user with ${req.params.id}.`);
//   } catch (err) {
//     console.error(err);
//     next(err);
//   }
// });

// router.get("/:id/comments", async (req, res, next) => {
//   try {
//     const user = await User.findOne({
//       where: { id: req.params.id },
//     });

//     const comments = await user.getComments();
//     if (user) res.json(comments);
//     else next(`There is no user with ${req.params.id}.`);
//   } catch (err) {
//     console.error(err);
//     next(err);
//   }
// });

// router.get("/:id", async (req, res, next) => {
//   try {
//     const user = await User.findOne({
//       where: { id: req.params.id },
//       attributes: ["id", "name", "description"],
//     });

//     if (user) res.json(user);
//     else next(`There is no user with ${req.params.id}.`);
//   } catch (err) {
//     console.error(err);
//     next(err);
//   }
// });
