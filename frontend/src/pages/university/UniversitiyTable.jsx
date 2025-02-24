import React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'


const Universities = [
    {
        id: 1,
        name: "SAGE University",
    },
    {
        id: 1,
        name: "AKTU University",
    },
    {
        id: 1,
        name: "RGPV University",
    },
]

const UniversitiyTable = () => {
    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold mb-4">Question Papers Available for following Universities</h2>
                <div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">University</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                Universities.map((uni)=>(
                                <TableRow key={uni.id}>
                                    <TableCell className="font-medium">{uni.name}</TableCell>
                                    <TableCell className="text-right">  <Link to='/program'><Button>Visit</Button></Link> </TableCell>
                                </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>

    )
}

export default UniversitiyTable
