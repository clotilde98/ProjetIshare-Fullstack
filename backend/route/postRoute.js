import { Router } from 'express';
import {
  getPost,
  getPosts,
  createPost,
  updatePost,
  deletePost,
  searchPostByCategory
} from '../controller/postController.js';

import {checkJWT} from '../middleware/identification/jwt.js'
import {postValidatorMiddleware} from '../middleware/validation.js';
import { mustBeAdmin } from '../middleware/identification/mustBeAdmin.js'; 

import {postOwner} from '../middleware/identification/postOwner.js';


const router = Router();

router.post("/", checkJWT, postValidatorMiddleware.createPostValidator, createPost);           
router.get("/byCategory", searchPostByCategory);  
router.get("/:id", getPost);     
router.get("/", getPosts);      
router.patch("/:id", checkJWT, postOwner, postValidatorMiddleware.updatePostValidator, updatePost);     
router.delete("/:id", checkJWT, postOwner, deletePost);      

export default router;
