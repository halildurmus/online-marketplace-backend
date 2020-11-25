const { mongodb, redis } = require('./db')
const { Listing } = mongodb
const { performance } = require('perf_hooks')

/**
 * Updates the specified counter in the Listing collection on MongoDB.
 * @param {String} counter Counter name to be updated
 * @returns {Promise<void>}
 */
async function updateCounter(counter) {
	const allKeys = (await redis.scan(0, 'MATCH', `${counter}_*`))[1]
	const bulk = []
	const hashes = []
	const keys = []
	const map = new Map()

	for (const key of allKeys) {
		keys.push({
			key,
			timestamp: Date.parse(key.replace(`${counter}_`, '')),
		})
	}

	keys.sort((a, b) => a.timestamp - b.timestamp).pop()
	console.log(keys)

	for (const key of keys) {
		const data = (await redis.hscan(key.key, '0'))[1]
		hashes.push(...data)
	}
	console.log(hashes)

	for (let i = 0; i < hashes.length - 1; i += 2) {
		if (!map.has(hashes[i])) {
			map.set(hashes[i], parseInt(hashes[i + 1]))
		} else {
			const currentCount = parseInt(map.get(hashes[i]))
			map.set(hashes[i], currentCount + parseInt(hashes[i + 1]))
		}
	}
	console.log(map)
	map.forEach((value, key) => {
		bulk.push({
			updateMany: {
				filter: { _id: key },
				update: { $inc: { [counter]: value } },
			},
		})
	})
	console.log(bulk)

	const t0 = performance.now()
	if (bulk.length > 0) {
		const result = await Listing.bulkWrite(bulk)
		console.log(result)
		await redis.del(keys)
	}
	const t1 = performance.now()
	console.log(`The execution of the function took ${t1 - t0} ms.`)
}

updateCounter('favorites').then()
updateCounter('views').then()
