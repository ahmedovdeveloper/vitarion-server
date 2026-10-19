export const sanitizeCommentPayload = (raw = {}) => {
  const rawName = String(raw.name ?? "").trim();
  const rawComment = String(raw.comment ?? "").trim();
  const rawRating = Number(raw.rating);

  const name = rawName ? rawName.slice(0, 60) : "Anonymous";
  const comment = rawComment.slice(0, 1000);
  const rating = Number.isFinite(rawRating)
    ? Math.min(5, Math.max(1, Math.round(rawRating)))
    : 5;

  return {
    name,
    comment,
    rating,
  };
};
