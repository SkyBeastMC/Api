/* @flow */

import { needAuth, needGroup, ADMIN } from './util'
import { ObjectID } from 'mongodb'

type ID = string
type Context = any
type Upload = any

// https://developer.mozilla.org/fr/docs/Web/HTTP/Basics_of_HTTP/MIME_types#Images_types

const IMAGE_MIME_TYPES = [
	'image/gif', // GIF images (lossless compression, superseded by PNG)
	'image/jpeg', // JPEG images
	'image/png', // PNG images
	'image/svg+xml' // SVG images (vector images)
]

export function setAvatar(
	root: any,
	{ file }: { file: Upload },
	context: Context
): Promise<Result> | Result {
	needAuth(context)
	if (!IMAGE_MIME_TYPES.includes(file.mimetype)) {
		context.storage.removeFile(file)
		return {
			error: `MimeType ${file.mimetype} is not and image Mime Type`
		}
	}
	return context.user
		.then(user => {
			user.avatar = context.storage.getUrl(file)
			return user.save()
		})
		.then(() => ({
			error: null
		}))
}

function transformAnime(anime: any, time, storage) {
	if (anime.cover) anime.cover = storage.getUrl(anime.cover)
	if (anime.background) anime.cover = storage.getUrl(anime.background)
	anime.edit_date = time
}

export function addAnime(
	root: any,
	{ anime }: { anime: AnimeInput },
	context: Context
): Promise<ID> {
	const time = now()
	transformAnime(anime, time, context.storage)
	// $FlowIgnore
	anime.posted_date = time
	return needGroup(context, ADMIN).then(() =>
		context.db
			.collection('animes')
			.insertOne(anime)
			.then(({ insertedId }) => insertedId)
	)
}

export function updateAnime(
	root: any,
	{ id, anime }: { id: ID, anime: AnimeInput },
	context: Context
): Promise<ID> {
	transformAnime(anime, now(), context.storage)
	return needGroup(context, ADMIN).then(() =>
		context.db
			.collection('animes')
			.updateOne({ _id: new ObjectID(id) }, { $set: anime })
			.then(() => id)
	)
}

export function addTag(
	root: any,
	{ tag }: { tag: TagInput },
	context: Context
): Promise<ID> {
	return needGroup(context, ADMIN).then(() =>
		context.db
			.collection('tags')
			.insertOne(tag)
			.then(({ insertedId }) => insertedId)
	)
}

export function updateTag(
	root: any,
	{ id, tag }: { id: ID, tag: TagUpdate },
	context: Context
): Promise<ID> {
	return needGroup(context, ADMIN).then(() =>
		context.db
			.collection('tags')
			.updateOne({ _id: new ObjectID(id) }, { $set: tag })
			.then(() => id)
	)
}

export function deleteTag(
	root: any,
	{ id }: { id: ID },
	context: Context
): Promise<ID> {
	return needGroup(context, ADMIN).then(() =>
		context.db
			.collection('tags')
			.deleteOne({ _id: new ObjectID(id) })
			.then(() => id)
	)
}

export function addAuthor(
	root: any,
	{ author }: { author: AuthorInput },
	context: Context
): Promise<ID> {
	if (author.picture) author.picture = context.storage.getUrl(author.picture)
	return needGroup(context, ADMIN).then(() =>
		context.db
			.collection('authors')
			.insertOne(author)
			.then(({ insertedId }) => insertedId)
	)
}

export function updateAuthor(
	root: any,
	{ id, author }: { id: ID, author: AuthorUpdate },
	context: Context
): Promise<ID> {
	if (author.picture) author.picture = context.storage.getUrl(author.picture)
	return needGroup(context, ADMIN).then(() =>
		context.db
			.collection('authors')
			.updateOne({ _id: new ObjectID(id) }, { $set: author })
			.then(() => id)
	)
}

export function deleteAuthor(
	root: any,
	{ id }: { id: ID },
	context: Context
): Promise<ID> {
	return needGroup(context, ADMIN).then(() =>
		context.db
			.collection('authors')
			.deleteOne({ _id: new ObjectID(id) })
			.then(() => id)
	)
}

function now() {
	return new Date().getTime()
}
