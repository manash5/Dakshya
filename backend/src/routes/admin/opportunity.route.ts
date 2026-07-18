import { Router } from "express";
import { AdminOpportunityController } from "../../controllers/admin/opportunity.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middleware/authorized.middleware";

const router = Router();
const adminOpportunityController = new AdminOpportunityController();

router.use(authorizedMiddleware, adminMiddleware);

router.post('/', adminOpportunityController.createOpportunity);
router.post('/scrape', adminOpportunityController.scrapeOpportunities);
router.put('/:id', adminOpportunityController.updateOpportunity);
router.delete('/:id', adminOpportunityController.deleteOpportunity);

export default router;
