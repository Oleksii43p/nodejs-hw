import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

// Отримати список усіх нотаток
export const getAllNotes = async (req, res) => {
  // Отримуємо параметри пагінації
  const { page = 1, perPage = 15, tag, search } = req.query;

  const skip = (page - 1) * perPage;

  // Створюємо базовий запит до колекції
  const notesQuery = Note.find();

  // Будуємо фільтр
  if (tag) {
    notesQuery.where('tag').equals(tag);
  }

  // Текстовий пошук по name (працює лише якщо створено текстовий індекс)
  if (search) {
    notesQuery.where({
      $text: { $search: search },
    });
  }

  // Виконуємо одразу два запити паралельно
  const [totalItems, notes] = await Promise.all([
    notesQuery.clone().countDocuments(),
    notesQuery.skip(skip).limit(perPage),
  ]);

  // Обчислюємо загальну кількість «сторінок»
  const totalPages = Math.ceil(totalItems / perPage);

  res.status(200).json({
    page,
    perPage,
    totalItems,
    totalPages,
    notes,
  });
};

// Отримати одноієї нотатки за id
export const getNoteById = async (req, res, next) => {
  const { noteId } = req.params;
  const note = await Note.findById(noteId);

  if (!note) {
    next(createHttpError(404, 'Note not found'));
    return;
  }

  res.status(200).json(note);
};

// Нова нотатка
export const createNote = async (req, res) => {
  const note = await Note.create(req.body);
  res.status(201).json(note);
};

// Видалення нотатки
export const deleteNote = async (req, res, next) => {
  const { noteId } = req.params;
  const note = await Note.findOneAndDelete({
    _id: noteId,
  });

  if (!note) {
    next(createHttpError(404, 'Note not found'));
    return;
  }

  res.status(200).json(note);
};

// Редагування нотатки
export const updateNote = async (req, res, next) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndUpdate({ _id: noteId }, req.body, {
    new: true,
  });

  if (!note) {
    next(createHttpError(404, 'Note not found'));
    return;
  }

  res.status(200).json(note);
};
