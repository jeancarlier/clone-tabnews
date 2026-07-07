function status(request, response) {
    
    response.status(200).json({ status: "Parabens" });
}

export default status;