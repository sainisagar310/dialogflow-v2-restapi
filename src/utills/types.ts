export type IOptional<T> = {
	[P in keyof T]?: T[P];
};
