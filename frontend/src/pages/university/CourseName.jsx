import React from 'react'
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Link } from 'react-router-dom'

const course = [

]

const CourseName = () => {
    return (
        <div className='mt-20'>
            <div className='flex justify-center'>
                <h2 className=" text-2xl font-bold mb-4">Choose a Course</h2>
            </div>
            <div className='mx-10 gap-4 flex flex-row justify-center flex-wrap md:flex md:justify-start '>
                {course && course.length > 0 ? (
                    course.map((course, index) => (
                        <Card className="w-40 overflow-hidden rounded-lg dark:bg-gray-800 bg-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ">
                            <div className="relative">
                                <img
                                    src="https://tse2.mm.bing.net/th?id=OIP.FV5O7INzORJM7JPkSRB2iwHaHa&pid=Api&P=0&h=180"
                                    alt="course"
                                    className="w-full h-36 object-cover rounded-t-lg"
                                />
                            </div>
                            <CardContent className='py-2 flex justify-center items-center'>
                                <Link to='/questions'><h1 className='hover:underline font-bold text-lg truncate'>Fluid Mechanics</h1></Link>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="text-red-500 text-center w-full">No Course Found</p>
                  )
                }

            </div>
        </div>
    )
}

export default CourseName
