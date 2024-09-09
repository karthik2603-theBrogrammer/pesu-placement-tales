"use client";

import React, { useState } from "react";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    Link,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from "@nextui-org/react";
import OtpInput from 'react-otp-input';
import { PiHamburger } from "react-icons/pi";


import { AcmeLogo } from "./AcmeLogo.jsx";

export default function App() {
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [backdrop, setBackdrop] = useState('blur');

    const handleOpen = () => {
        onOpen();
    };

    const handleOtpSubmit = () => {
        const correctOtp = process.env.NEXT_PUBLIC_ADMIN_OTP; // Ensure this is set in your .env file
        if (otp === correctOtp) {
            window.location.href = '/admin'; // Redirect on successful OTP
        } else {
            setOtpError('Invalid OTP. Please try again.');
        }
    };

    return (
        <div className="">
            <Navbar shouldHideOnScroll className="bg-transparent">
                <NavbarBrand>
                    <Button as={Link} color="warning" href="/" variant="light">
                        Placement Tales
                    </Button>
                </NavbarBrand>
                <NavbarContent className="hidden sm:flex gap-4" justify="center">
                    <NavbarItem>
                        <Button as={Link} color="default" href="/" variant="shadow">
                            Features 🚨
                        </Button>
                    </NavbarItem>
                    <NavbarItem isActive>
                        <Button as={Link} color="success" href="add-student" variant="light">
                            Contribute! 🚀
                        </Button>
                    </NavbarItem>
                    <NavbarItem isActive>
                        <Button as={Link} color="success" href="add-student" variant="light">
                            Browse
                        </Button>
                    </NavbarItem>
                    <NavbarItem>
                        <Button as={Link} color="default" href="/" variant="light">
                            Feature Request
                        </Button>
                    </NavbarItem>
                    <NavbarItem>
                        <Button as={Link} color="default" href="/" variant="light">
                            Bug Report
                        </Button>
                    </NavbarItem>

                </NavbarContent>
                <NavbarContent justify="end">
                    <NavbarItem className="hidden lg:flex">
                        <Button as={Link} color="success" href="#" variant="flat" onClick={() => handleOpen()}>
                            Admin
                        </Button>
                    </NavbarItem>
                    <NavbarItem className="sm:hidden">
                        <Dropdown>
                            <DropdownTrigger>
                                {/* <Button auto flat color="primary">
                                    Menu
                                </Button> */}
                                <Button color="success" variant="flat" auto flat>
                                    <PiHamburger size={15} />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Navbar Menu">
                                <DropdownItem>
                                    <Button as={Link} color="default" href="/" variant="shadow">
                                        Features 🚨
                                    </Button>
                                </DropdownItem>
                                <DropdownItem>
                                    <Button as={Link} color="success" href="add-student" variant="light">
                                        Contribute! 🚀
                                    </Button>
                                </DropdownItem>
                                <DropdownItem>
                                    <Button as={Link} color="success" href="add-student" variant="light">
                                        Browse
                                    </Button>
                                </DropdownItem>
                                <DropdownItem>
                                    <Button as={Link} color="default" href="/" variant="light">
                                        Feature Request
                                    </Button>
                                </DropdownItem>
                                <DropdownItem>
                                    <Button as={Link} color="default" href="/" variant="light">
                                        Bug Report
                                    </Button>
                                </DropdownItem>

                                <DropdownItem>
                                    <Button as={Link} color="success" href="#" variant="flat" onClick={() => handleOpen()}>
                                        Admin
                                    </Button>
                                </DropdownItem>

                            </DropdownMenu>
                        </Dropdown>
                    </NavbarItem>
                </NavbarContent>
            </Navbar>
            {/* OTP Modal */}
            <Modal backdrop={backdrop} isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Authenticate To Admin - Enter OTP</ModalHeader>
                            <ModalBody className="flex flex-col items-center justify-center">
                                <OtpInput
                                    value={otp}
                                    onChange={setOtp}
                                    numInputs={5}
                                    renderInput={(props) => <input {...props} className="otp-input mx-1" style={{ width: 55 }} />}
                                />
                                {otpError && <p className="text-danger">{otpError}</p>}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="warning" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="danger" onPress={handleOtpSubmit} variant="flat">
                                    Verify
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
