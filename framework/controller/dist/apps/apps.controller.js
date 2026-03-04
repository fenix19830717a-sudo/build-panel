"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const apps_service_1 = require("./apps.service");
const create_app_dto_1 = require("./dto/create-app.dto");
const update_app_dto_1 = require("./dto/update-app.dto");
const deploy_app_dto_1 = require("./dto/deploy-app.dto");
const app_entity_1 = require("./entities/app.entity");
let AppsController = class AppsController {
    constructor(appsService) {
        this.appsService = appsService;
    }
    findAll(status) {
        return this.appsService.findAll(status);
    }
    findOne(id) {
        return this.appsService.findOne(id);
    }
    create(createAppDto, req) {
        return this.appsService.create(createAppDto, req.user.userId);
    }
    update(id, updateAppDto) {
        return this.appsService.update(id, updateAppDto);
    }
    remove(id) {
        return this.appsService.remove(id);
    }
    deploy(id, deployAppDto, req) {
        return this.appsService.deploy(id, deployAppDto, req.user.userId);
    }
    findByServer(serverId, req) {
        return this.appsService.findByServer(serverId, req.user.userId);
    }
};
exports.AppsController = AppsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_app_dto_1.CreateAppDto, Object]),
    __metadata("design:returntype", void 0)
], AppsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_app_dto_1.UpdateAppDto]),
    __metadata("design:returntype", void 0)
], AppsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/deploy'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, deploy_app_dto_1.DeployAppDto, Object]),
    __metadata("design:returntype", void 0)
], AppsController.prototype, "deploy", null);
__decorate([
    (0, common_1.Get)('server/:serverId/apps'),
    __param(0, (0, common_1.Param)('serverId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppsController.prototype, "findByServer", null);
exports.AppsController = AppsController = __decorate([
    (0, common_1.Controller)('apps'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [apps_service_1.AppsService])
], AppsController);
//# sourceMappingURL=apps.controller.js.map