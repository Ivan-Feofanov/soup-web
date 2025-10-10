import type { Recipe } from './types';

export const recipes: Recipe[] = [
	{
		id: 'golden-tomato-soup',
		title: 'Golden Tomato Soup',
		description:
			'A bright, cozy tomato soup with a silky finish and a hint of basil. Perfect weeknight staple.',
		createdAt: '2025-10-08T18:30:00Z',
		author: 'Ava',
		tags: ['soup', 'vegetarian'],
		ingredients: [
			{
				id: 'ingredient1',
				name: 'Tomatoes',
				quantity: 2,
				unit: 'cups'
			},
			{
				id: 'ingredient2',
				name: 'Onions',
				quantity: 1,
				unit: 'medium'
			},
			{
				id: 'ingredient3',
				name: 'Garlic',
				quantity: 3,
				unit: 'cloves'
			},
			{
				id: 'ingredient4',
				name: 'Basil',
				quantity: 1,
				unit: 'teaspoon'
			},
			{
				id: 'ingredient5',
				name: 'Salt',
				quantity: 1,
				unit: 'teaspoon'
			},
			{
				id: 'ingredient6',
				name: 'Pepper',
				quantity: 1,
				unit: 'teaspoon'
			},
			{
				id: 'ingredient7',
				name: 'Water',
				quantity: 4,
				unit: 'cups'
			}
		],
		instructions: [
			{
				id: 'instruction1',
				content: 'Preheat oven to 450°F.'
			},
			{
				id: 'instruction2',
				content: 'Mix flour, water, and salt in a large bowl.'
			},
			{
				id: 'instruction3',
				content: 'Knead dough for 10 minutes.'
			},
			{
				id: 'instruction4',
				content: 'Shape dough into a ball and place on a baking sheet.'
			},
			{
				id: 'instruction5',
				content: 'Bake for 30 minutes.',
				timer: 30
			}
		],
		comments: [
			{
				id: 'comment1',
				content: 'This soup is amazing!',
				createdAt: '2025-10-09T10:00:00Z',
				author: 'John'
			},
			{
				id: 'comment2',
				content: 'I love the hint of basil!',
				createdAt: '2025-10-10T14:30:00Z',
				author: 'Jane'
			}
		]
	},
	{
		id: 'crusty-bread-bowl',
		title: 'Crusty Bread Bowl',
		description: 'No-knead bread with a crackly crust—great for serving soups.',
		createdAt: '2025-10-07T14:10:00Z',
		author: 'Max',
		tags: ['baking'],
		ingredients: [
			{
				id: 'ingredient8',
				name: 'Flour',
				quantity: 2,
				unit: 'cups'
			},
			{
				id: 'ingredient9',
				name: 'Water',
				quantity: 1,
				unit: 'cup'
			},
			{
				id: 'ingredient10',
				name: 'Salt',
				quantity: 1,
				unit: 'teaspoon'
			},
			{
				id: 'ingredient11',
				name: 'Yeast',
				quantity: 1,
				unit: 'teaspoon'
			}
		],
		instructions: [
			{
				id: 'instruction1',
				content: 'Mix flour, water, salt, and yeast in a large bowl.',
				timer: 5
			},
			{
				id: 'instruction2',
				content: 'Cover and let rise in a warm place for 1 hour.',
				timer: 60
			},
			{
				id: 'instruction3',
				content: 'Knead dough for 10 minutes.'
			},
			{
				id: 'instruction4',
				content: 'Shape into a ball and place on a baking sheet.',
				timer: 5
			},
			{
				id: 'instruction5',
				content: 'Bake for 30 minutes.',
				timer: 30
			}
		],
		comments: [
			{
				id: 'comment3',
				content: 'Delicious!',
				createdAt: '2025-10-08T16:00:00Z',
				author: 'Emma'
			},
			{
				id: 'comment4',
				content: 'I love the crust!',
				createdAt: '2025-10-09T12:30:00Z',
				author: 'Sophia'
			}
		]
	},
	{
		id: 'miso-ramen',
		title: 'Weeknight Miso Ramen',
		description: 'Umami-packed miso broth with noodles, tofu, and greens in under 25 minutes.',
		createdAt: '2025-10-06T20:05:00Z',
		author: 'Lina',
		tags: ['noodles', 'quick'],
		ingredients: [
			{
				id: 'ingredient12',
				name: 'Miso Paste',
				quantity: 2,
				unit: 'tablespoons'
			},
			{
				id: 'ingredient13',
				name: 'Noodles',
				quantity: 1,
				unit: 'package'
			},
			{
				id: 'ingredient14',
				name: 'Tofu',
				quantity: 1,
				unit: 'block'
			},
			{
				id: 'ingredient15',
				name: 'Green Onions',
				quantity: 1,
				unit: 'bunch'
			}
		],
		instructions: [
			{
				id: 'instruction1',
				content: 'Heat miso paste in a small saucepan over medium heat until melted.'
			},
			{
				id: 'instruction2',
				content: 'Add water and bring to a boil.'
			},
			{
				id: 'instruction3',
				content: 'Knead dough for 10 minutes.'
			},
			{
				id: 'instruction4',
				content: 'Shape into a ball and place on a baking sheet.',
				timer: 5
			},
			{
				id: 'instruction5',
				content: 'Bake at 375°F for 15 minutes.'
			}
		],
		comments: [
			{
				id: 'comment5',
				content: 'Yum!',
				createdAt: '2025-10-07T18:30:00Z',
				author: 'Olivia'
			},
			{
				id: 'comment6',
				content: 'I love the miso!',
				createdAt: '2025-10-08T10:00:00Z',
				author: 'Ava'
			}
		]
	},
	{
		id: 'harvest-chili',
		title: 'Harvest Bean Chili',
		description: 'Hearty three-bean chili with roasted corn and smoky spices.',
		createdAt: '2025-10-05T09:00:00Z',
		author: 'Noah',
		tags: ['stew', 'vegan', 'meal-prep'],
		ingredients: [
			{
				id: 'ingredient16',
				name: 'Beans',
				quantity: 2,
				unit: 'cans'
			},
			{
				id: 'ingredient17',
				name: 'Corn',
				quantity: 1,
				unit: 'can'
			},
			{
				id: 'ingredient18',
				name: 'Spices',
				quantity: 1,
				unit: 'package'
			}
		],
		instructions: [
			{
				id: 'instruction1',
				content: 'Heat oil in a large pot over medium heat.'
			},
			{
				id: 'instruction2',
				content: 'Add onion and garlic and cook until softened.'
			},
			{
				id: 'instruction3',
				content: 'Add beans, corn, and spices.'
			},
			{
				id: 'instruction4',
				content: 'Simmer for 20 minutes.',
				timer: 20
			}
		],
		comments: [
			{
				id: 'comment7',
				content: 'Delicious!',
				createdAt: '2025-10-06T16:00:00Z',
				author: 'Emma'
			},
			{
				id: 'comment8',
				content: 'I love the corn!',
				createdAt: '2025-10-07T12:30:00Z',
				author: 'Sophia'
			}
		]
	},
	{
		id: 'pumpkin-gnocchi',
		title: 'Brown Butter Pumpkin Gnocchi',
		description: 'Pillowy gnocchi tossed in nutty brown butter and crispy sage.',
		createdAt: '2025-10-04T16:45:00Z',
		author: 'Maya',
		tags: ['pasta', 'comfort'],
		ingredients: [
			{
				id: 'ingredient19',
				name: 'Pumpkin Puree',
				quantity: 1,
				unit: 'cup'
			},
			{
				id: 'ingredient20',
				name: 'Flour',
				quantity: 2,
				unit: 'cups'
			},
			{
				id: 'ingredient21',
				name: 'Salt',
				quantity: 1,
				unit: 'teaspoon'
			},
			{
				id: 'ingredient22',
				name: 'Brown Butter',
				quantity: 1,
				unit: 'tablespoon'
			},
			{
				id: 'ingredient23',
				name: 'Sage',
				quantity: 1,
				unit: 'tablespoon'
			}
		],
		instructions: [
			{
				id: 'instruction1',
				content: 'Preheat oven to 400°F.'
			},
			{
				id: 'instruction2',
				content: 'Mix pumpkin puree, flour, and salt in a bowl.'
			},
			{
				id: 'instruction3',
				content: 'Knead dough until smooth.'
			},
			{
				id: 'instruction4',
				content: 'Simmer for 20 minutes.',
				timer: 20
			}
		],
		comments: [
			{
				id: 'comment9',
				content: 'Yummy!',
				createdAt: '2025-10-05T18:30:00Z',
				author: 'Olivia'
			},
			{
				id: 'comment10',
				content: 'I love the gnocchi!',
				createdAt: '2025-10-06T10:00:00Z',
				author: 'Ava'
			}
		]
	},
	{
		id: 'garden-salad',
		title: 'Crunchy Garden Salad',
		description: 'Fresh greens, herbs, and a lemony dressing for the perfect side.',
		createdAt: '2025-01-01T12:00:00Z', // Changed to an older date to be less recent
		author: 'Omar',
		tags: ['salad'],
		ingredients: [
			{
				id: 'ingredient24',
				name: 'Lettuce',
				quantity: 1,
				unit: 'head'
			},
			{
				id: 'ingredient25',
				name: 'Tomatoes',
				quantity: 4,
				unit: 'medium'
			},
			{
				id: 'ingredient26',
				name: 'Onions',
				quantity: 1,
				unit: 'small'
			},
			{
				id: 'ingredient27',
				name: 'Cucumber',
				quantity: 1,
				unit: 'medium'
			},
			{
				id: 'ingredient28',
				name: 'Balsamic Vinegar',
				quantity: 2,
				unit: 'tablespoons'
			},
			{
				id: 'ingredient29',
				name: 'Lemon Juice',
				quantity: 1,
				unit: 'tablespoon'
			},
			{
				id: 'ingredient30',
				name: 'Salt',
				quantity: 1,
				unit: 'teaspoon'
			},
			{
				id: 'ingredient31',
				name: 'Pepper',
				quantity: 1,
				unit: 'teaspoon'
			}
		],
		instructions: [
			{
				id: 'instruction1',
				content: 'Wash and dry all vegetables.'
			},
			{
				id: 'instruction2',
				content: 'Slice tomatoes and onions.'
			},
			{
				id: 'instruction3',
				content: 'Shred lettuce.'
			},
			{
				id: 'instruction4',
				content: 'Dice cucumber.'
			},
			{
				id: 'instruction5',
				content: 'Mix all ingredients in a bowl.'
			},
			{
				id: 'instruction6',
				content: 'Drizzle with dressing.'
			}
		],
		comments: [
			{
				id: 'comment11',
				content: 'Great salad!',
				createdAt: '2025-10-08T14:00:00Z',
				author: 'Isabella'
			},
			{
				id: 'comment12',
				content: 'I love the herbs!',
				createdAt: '2025-10-09T09:30:00Z',
				author: 'Mia'
			}
		]
	}
];
