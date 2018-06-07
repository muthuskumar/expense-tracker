import ValidationError from "../../validation.error";
import { VALIDATION_MESSAGES } from '../auth.constants';
import { BaseController } from '../../base.controller';

var validators = {
    isUserIdAvailable: function (user) {
        if (!user || !user._id)
            throw new ValidationError('userId', VALIDATION_MESSAGES.USERID_UNAVAILABLE);
    }
};

var baseController = new BaseController();

export default function userIdSerializer(user, req, res) {
    try {
        validators.isUserIdAvailable(user);
        
        req.userId = user._id;
    } catch (err) {
        baseController.handleErrorSync(err, res, baseController.getStatusCodeForError(err));
    }
}
