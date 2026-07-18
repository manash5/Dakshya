import { Router } from "express";
import { OpportunityController } from "../controllers/opportunity.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const opportunityController = new OpportunityController();

router.use(authorizedMiddleware);

router.get('/', opportunityController.getOpportunities);
router.get('/:id', opportunityController.getOpportunityById);

export default router;
