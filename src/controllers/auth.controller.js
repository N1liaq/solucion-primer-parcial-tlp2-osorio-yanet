// * ARCHIVO A COMPLETAR
import { UserModel, ProfileModel } from "../models/index.js";
import { hashPassword, comparePassword } from "../helpers/bcrypt.helper.js";
import { signToken } from "../helpers/jwt.helper.js";
import { sequelize } from "../config/db.js";

export const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role,
      employee_number,
      first_name,
      last_name,
      phone,
    } = req.body;

    // TODO: 1. Hashear la password antes de guardarla (hashPassword).
    const hashedPassword = await hashPassword(password);
    // TODO: 2. Crear el user y su profile asociado.
    await sequelize.transaction(async (t) => {
      const newUser = await UserModel.create(
        {
          username,
          email,
          password: hashedPassword,
          role,
        },
        { transaction: t },
      );
      const newProfile = await ProfileModel.create(
        {
          employee_number,
          first_name,
          last_name,
          phone,
          user_id: newUser.id,
        },
        {
          transaction: t,
        },
      );

      return { user: newUser, profile: newProfile };
    });

    const user = await UserModel.findByPk(newUser.id, {
      attributes: { exclude: ["password"] },
    });

    // TODO: 3. Responder con código 201, un mensaje de éxito y devolver el usuario sin la password.
    return res.status(201).json({
      message: "Usuario creado correctamente",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // TODO: 1. Buscar el user por email y comparar la password (comparePassword).
    const emailExist = await UserModel.findOne({
      where: {
        email,
      },
    });

    if (!emailExist) {
      return res.status(401).json({
        message: "Credenciales incorrectas",
      });
    }
    const validPassword = await comparePassword(password, emailExist.password);

    if (!validPassword) {
      return res.status(401).json({
        message: "Credenciales incorrectas",
      });
    }
    // TODO: 2. Firmar un JWT con el id y el role del user (signToken).
    const token = signToken({ user_id: emailExist.id, role: emailExist.role });

    // TODO: 3. Guardar el token en una cookie httpOnly llamada "token", responder con código 200 y un mensaje de éxito.
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    });
    return res.status(201).json({
      message: "Usuario logueado correctamente",
    });
    // ? Considerar qué mensaje devolver ante credenciales inválidas.
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

export const logout = async (_req, res) => {
  try {
    // TODO: 1. Eliminar la cookie "token" y responder con código 204 sin devolver ningun mensaje.
    res.clearCookie("token");
    return res.status(204).send();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};
