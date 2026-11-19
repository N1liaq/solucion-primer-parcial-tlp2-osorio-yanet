// * ARCHIVO A COMPLETAR
import { ProjectModel, TechnologyModel, UserModel } from "../models/index.js";

export const createProject = async (req, res) => {
  try {
    // TODO: 1. Crear el project con los datos del body que ya pasaron la validación.

    const {
      code,
      name,
      description,
      status,
      start_date,
      budget,
      leader_id,
      technologies,
    } = req.body;

    // ? Revisar de dónde debe salir el leader del proyecto.

    const newProject = await ProjectModel.create({
      code,
      name,
      description,
      status,
      start_date,
      budget,
      leader_id,
    });

    // TODO: 2. Asociar al project las technologies recibidas.
    if (technologies?.length) await newProject.setTechnologies(technologies);

    // TODO: 3. Responder con código 201 y el project con sus technologies y su leader.

    const result = await ProjectModel.findByPk(newProject.id, {
      include: [
        {
          model: TechnologyModel,
          as: "technologies",
        },
        {
          model: UserModel,
          as: "leader",
          attributes: { exclude: ["password"] },
        },
      ],
    });

    return res.status(201).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    // TODO: 1. Listar todos los projects incluyendo su leader (sin la password) y sus technologies, y responder con código 200 y los projects..
    const projects = await ProjectModel.findAll({
      include: [
        {
          model: UserModel,
          as: "leader",
          attributes: { exclude: ["password"] },
        },
        { model: TechnologyModel, as: "technologies" },
      ],
    });

    return res.status(200).json(projects);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

export const getMyProjects = async (req, res) => {
  try {
    // TODO: 1. Listar los projects cuyo leader sea el usuario logueado, incluyendo sus technologies, y responder con código 200 y los projects.

    const projects = await ProjectModel.findAll({
      where: { leader_id: req.user.id },
      include: [{ model: TechnologyModel, as: "technologies" }],
    });
    return res.status(200).json(projects);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

export const updateProject = async (req, res) => {
  try {
    // TODO: 1. Actualizar el project con los datos recibidos.
    const { id } = req.params;

    const {
      code,
      name,
      description,
      status,
      start_date,
      budget,
      technologies,
    } = req.body;

    // TODO: 2. Reemplazar sus technologies si vienen en el body.
    const projectUpdate = await ProjectModel.findByPk(id);

    if (!projectUpdate) {
      return res.status(404).json({
        message: "¡El ID del project que esta buscando no fue encontrado!",
      });
    }

    await projectUpdate.update({
      code,
      name,
      description,
      status,
      start_date,
      budget,
    });

    if (technologies) await projectUpdate.setTechnologies(technologies);

    const projectUpdateExists = await ProjectModel.findByPk(projectUpdate.id, {
      include: [
        {
          model: TechnologyModel,
          as: "technologies",
        },
        {
          model: UserModel,
          as: "leader",
          attributes: { exclude: ["password"] },
        },
      ],
    });

    // TODO: 3. Responder con código 200 y el project actualizado, incluyendo su leader y sus technologies.
    return res.status(200).json({
      message: "Project actualizado correctamente.",
      projectUpdateExists,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    // TODO: 1. Eliminar el project y responder con código 204 sin devolver ningún mensaje.

    const { id } = req.params;

    const projectExists = await ProjectModel.findByPk(id);

    if (!projectExists) {
      return res.status(404).json({
        message: "¡El ID del project que esta buscando no fue encontrado!",
      });
    }

    await projectExists.destroy();

    res.status(204).send();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};
