// Ran this in data explorer
r.db('spoke')
  .table('message')
  .getAll(true, { index: 'is_from_contact' })
  .group(r.row('service_messages')('messageId'), { multi: true })
  .count()
  .ungroup()
  .filter((row) => row('reduction').gt(1))
  .filter((row) => row('group').ne(null))
  .forEach((row) => r.db('spoke')
    .table('message')
    .getAll(row('group'), { index: 'service_message_ids' })
    .limit(r.db('spoke')
      .table('message')
      .getAll(row('group'), { index: 'service_message_ids' }).count().sub(1))
//    .delete())