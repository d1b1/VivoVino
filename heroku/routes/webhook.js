const _ = require('underscore')
const algolia = require('../services/algolia');
const takeshape = require('../services/takeshape')
const titleCase = require('title-case')

module.exports = function(req, res) {

	// Echo what is happening.
	var body = req.body
	body.data.queryName = 'get' + titleCase(body.data.contentTypeName)

	console.log('Action', body.action, 'Body', body);

	// Set the index for the content type.
	const index = algolia.initIndex(body.data.contentTypeName);

	// If the action is to delete, then we do it now and stop the code.
	if (body.action === "content:delete") {
		index.deleteObject(body.data.contentId, () => {
			return res.status(200).send('Removed Index item')
		})
	}

	var query = ` {
		${body.data.queryName}(_id: "${body.data.contentId}") {
			_id
    appellation
    grapes {
      _id
      nameOfGrape
    }
    organicType
    photo {
      _id
      caption
      credit
      description
      filename
      mimeType
      path
      sourceUrl
      title
      uploadStatus
    }
    wineIsFrom {
      country
      town
    }
    wineName
    winery {
      _id
      locationOfWinery {
        country
        town
      }
      winery
    }
  }
		}
	}`;

	takeshape(query).then(result => {

		console.log('')
		console.log(result)
		console.log('')

		var obj = result.data[body.data.queryName];
		obj.objectID = obj._id

		index.addObject(obj, () => {
			console.log(`Indexed ${body.data.contentTypeName} id: ${body.data.contentId} `)
			res.status(200).send(`Handled a Webhook Request for ${body.data.contentTypeName} id: ${body.data.contentId}`)
		})
	})

}
