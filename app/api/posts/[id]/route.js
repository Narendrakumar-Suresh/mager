// app/api/posts/[id]/route.js
export const GET = async (request, { params }) => {
    const { id } = params
    
    return new Response(JSON.stringify({ 
      id, 
      title: `Post ${id}` 
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  export const POST = async (request, { params }) => {
    const body = await request.json()
    
    return new Response(JSON.stringify({ 
      success: true,
      data: body
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  export const DELETE = async (request, { params }) => {
    return new Response(null, { status: 204 })
  }