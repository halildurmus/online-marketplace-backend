module.exports = [
	{
		id: 10,
		subject: `I think it's a scam`,
	},
	{
		id: 20,
		subject: `It's a duplicate listing`,
	},
	{
		id: 30,
		subject: `It's in the wrong category`,
	},
	{
		id: 40,
		// TODO: Replace *** with my app's name.
		subject: `It shouldn't be on ***`,
		children: [
			{
				id: 41,
				subject: 'Drugs, alcohol or tobacco',
			},
			{
				id: 42,
				subject: 'Other',
			},
			{
				id: 43,
				subject: 'Sexual content',
			},
			{
				id: 44,
				subject: 'Weapons or violent content',
			},
		],
	},
]
