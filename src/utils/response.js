// ✔ Genel başarılı response
export const success = (res, message = "OK", data = {}, status = 200) => {
  return res.status(status).json({
    status: "success",
    message,
    data,
  });
};

// ✔ 201 CREATED için özel
export const created = (res, message = "Created", data = {}) => {
  return res.status(201).json({
    status: "success",
    message,
    data,
  });
};

// ✔ 204 No Content (ör. delete işlemi)
export const noContent = (res) => {
  return res.status(204).send();
};

// ❌ Genel hata response
export const error = (res, message = "Error", status = 400, errors = null) => {
  return res.status(status).json({
    status: "error",
    message,
    errors,
  });
};

// ❌ JWT geçersiz / login yok
export const unauthorized = (res, message = "Unauthorized") => {
  return res.status(401).json({
    status: "error",
    message,
  });
};

// ❌ Erişim yasak (ör. başka birinin profilini düzenlemek)
export const forbidden = (res, message = "Forbidden") => {
  return res.status(403).json({
    status: "error",
    message,
  });
};

// ❌ Aranan kaynak yok
export const notFound = (res, message = "Not Found") => {
  return res.status(404).json({
    status: "error",
    message,
  });
};

// ❌ Sunucu hatası (try/catch yakalanmayan)
export const serverError = (res, message = "Internal Server Error") => {
  return res.status(500).json({
    status: "error",
    message,
  });
};

// ✔️ Pagination response (listeleme işlemleri)
export const paginate = (res, message, data, page, limit, total) => {
  return res.status(200).json({
    status: "success",
    message,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

// ✔ Validation Error (Zod, Joi, Yup için hazır)
export const validationError = (res, errors, message = "Validation Failed") => {
  return res.status(422).json({
    status: "error",
    message,
    errors,
  });
};
