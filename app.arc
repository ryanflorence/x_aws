@app
remix-website-8e12

@http
/seed
  method get
  src server
/*
  method any
  src server

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
  id *String
  name String
  markdown String
  ref String
  lang String
  html String
  parentId String

ghRef
  ref *String
