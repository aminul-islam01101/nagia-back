import { UserController } from "./user.controller";
import { UserService } from "./user.service";

export class UserModule {
  readonly userService: UserService;
  readonly userController: UserController;

  constructor() {
    this.userService = new UserService();
    this.userController = new UserController(this.userService)
  }
}
