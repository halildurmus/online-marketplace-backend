function findSubject(data, id) {
	for (const node of data) {
		if (node.id === id) return node.subject
		if (node.children) {
			const desiredNode = findSubject(node.children, id)
			if (desiredNode) return desiredNode
		}
	}

	return false
}

module.exports.findSubject = findSubject
