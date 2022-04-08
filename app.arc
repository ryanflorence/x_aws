@app
remix-website-8e12

@http
/*
  method any
  src server

# @events
# seed
#   src events/seed

@static

@tables
user
  pk *String

password
  pk *String # userId

note
  pk *String  # userId
  sk **String # noteId

doc
  pk *String
  name String
  markdown String
  ref String
  lang String
  html String
  parentId String

docRef
  pk *String
  status String
  
